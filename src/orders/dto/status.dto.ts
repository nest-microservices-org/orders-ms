import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "@prisma/client";
import { orderStatusList } from "../enum/order.enum";

export class StatusDto {
  @IsOptional()
  @IsEnum(orderStatusList, {
    message: 'Invalid Status',
  })
  status: OrderStatus
}