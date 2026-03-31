import { CreateSlotDto, UpdateSlotDto } from '../dtos/slot.dto';
import { DayOfWeek } from '../enums/slot.enum';
import { Slot } from '../entities/slot.entity';

export interface ISlotRepository {
  getAll(): Promise<Slot[]>;
  getAllByStaffId(staffId: number): Promise<Slot[]>;
  getByStaffAndDay(staffId: number, dayOfWeek: DayOfWeek): Promise<Slot[]>;
  getById(id: number): Promise<Slot>;
  create(staffId: number, dto: CreateSlotDto): Promise<Slot>;
  update(dto: UpdateSlotDto): Promise<Slot>;
  delete(id: number): Promise<boolean>;
}
