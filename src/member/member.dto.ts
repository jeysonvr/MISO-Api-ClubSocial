import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsDateString()
  @IsNotEmpty()
  readonly birthdate: Date;
}
