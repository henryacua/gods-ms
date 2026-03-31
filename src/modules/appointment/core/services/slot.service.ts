import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ISlotRepository } from '../interfaces/slot.repository';
import { Slot } from '../entities/slot.entity';
import { CreateSlotDto, UpdateSlotDto } from '../dtos/slot.dto';
import { DayOfWeek } from '../enums/slot.enum';
import { SlotErrors } from '../errors/slot.errors';

@Injectable()
export class SlotService {
  constructor(
    @Inject('ISlotRepository')
    private readonly slotRepository: ISlotRepository,
  ) {}

  async getAll(): Promise<Slot[]> {
    return this.slotRepository.getAll();
  }

  async getAllByStaffId(staffId: number): Promise<Slot[]> {
    return this.slotRepository.getAllByStaffId(staffId);
  }

  async getById(id: number): Promise<Slot> {
    return this.slotRepository.getById(id);
  }

  async create(staffId: number, dto: CreateSlotDto): Promise<Slot> {
    const existing = await this.slotRepository.getByStaffAndDay(
      staffId,
      dto.dayOfWeek,
    );
    this.assertNoOverlap(existing, dto.startTime, dto.endTime);
    return this.slotRepository.create(staffId, dto);
  }

  async update(dto: UpdateSlotDto): Promise<Slot> {
    const current = await this.slotRepository.getById(dto.id);

    // Compute effective values after the update
    const effectiveDay = (dto.dayOfWeek ?? current.dayOfWeek) as DayOfWeek;
    const effectiveStart = dto.startTime ?? current.startTime;
    const effectiveEnd = dto.endTime ?? current.endTime;

    const existing = await this.slotRepository.getByStaffAndDay(
      current.staffId,
      effectiveDay,
    );
    this.assertNoOverlap(existing, effectiveStart, effectiveEnd, dto.id);

    return this.slotRepository.update(dto);
  }

  async delete(id: number): Promise<boolean> {
    return this.slotRepository.delete(id);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Normalise "HH:MM" → "HH:MM:SS" so string comparison works uniformly
   * against the "HH:MM:SS" values that TypeORM returns from a TIME column.
   */
  private normalizeTime(t: string): string {
    return t.length === 5 ? `${t}:00` : t;
  }

  /**
   * Two time intervals [A, B] and [C, D] conflict (overlap, containment OR
   * touching) when:  A <= D  AND  C <= B
   *
   * Using `<=` instead of `<` is what prevents touching
   * (e.g. 09:00-10:00 and 10:00-12:00 are rejected).
   *
   * @param existing  Slots already persisted for this staff+day
   * @param startTime New slot start (HH:MM or HH:MM:SS)
   * @param endTime   New slot end   (HH:MM or HH:MM:SS)
   * @param excludeId Skip this slot id (used when updating an existing slot)
   */
  private assertNoOverlap(
    existing: Slot[],
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): void {
    const newStart = this.normalizeTime(startTime);
    const newEnd = this.normalizeTime(endTime);

    for (const s of existing) {
      if (excludeId !== undefined && s.id === excludeId) continue;

      const existStart = this.normalizeTime(s.startTime);
      const existEnd = this.normalizeTime(s.endTime);

      if (existStart <= newEnd && newStart <= existEnd) {
        throw new BadRequestException(SlotErrors.SLOT_OVERLAP);
      }
    }
  }
}
