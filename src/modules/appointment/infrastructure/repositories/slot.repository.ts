import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { ISlotRepository } from '../../core/interfaces/slot.repository';
import { Slot } from '../../core/entities/slot.entity';
import { SlotErrors } from '../../core/errors/slot.errors';
import { CreateSlotDto, UpdateSlotDto } from '../../core/dtos/slot.dto';
import { DayOfWeek } from '../../core/enums/slot.enum';

export class SlotRepository implements ISlotRepository {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async getAll(): Promise<Slot[]> {
    try {
      return this.slotRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(SlotErrors.SLOT_NOT_FOUND);
    }
  }

  async getAllByStaffId(staffId: number): Promise<Slot[]> {
    try {
      return this.slotRepository.find({ where: { staffId } });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(SlotErrors.SLOT_NOT_FOUND);
    }
  }

  async getByStaffAndDay(
    staffId: number,
    dayOfWeek: DayOfWeek,
  ): Promise<Slot[]> {
    try {
      return this.slotRepository.find({ where: { staffId, dayOfWeek } });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(SlotErrors.SLOT_NOT_FOUND);
    }
  }

  async getById(id: number): Promise<Slot> {
    try {
      const slot = await this.slotRepository.findOneBy({ id });

      if (!slot) {
        throw new NotFoundException(SlotErrors.SLOT_NOT_FOUND);
      }

      return slot;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new NotFoundException(SlotErrors.SLOT_NOT_FOUND);
    }
  }

  async create(staffId: number, dto: CreateSlotDto): Promise<Slot> {
    try {
      const slot = this.slotRepository.create({ staffId, ...dto });
      return this.slotRepository.save(slot);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, staffId, dto });
      }
      throw new Error(SlotErrors.COULD_NOT_CREATE);
    }
  }

  async update(dto: UpdateSlotDto): Promise<Slot> {
    try {
      const slot = await this.getById(dto.id);
      Object.assign(slot, dto);
      return this.slotRepository.save(slot);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, dto });
      }
      throw new Error(SlotErrors.COULD_NOT_UPDATE);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const slot = await this.getById(id);
      await this.slotRepository.softRemove(slot);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new Error(SlotErrors.COULD_NOT_DELETE);
    }
  }
}
