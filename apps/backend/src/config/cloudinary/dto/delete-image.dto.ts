import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class DeleteImageDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  publicIds!: string[];
}
