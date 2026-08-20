import { StaticContentStatus, StaticContentType } from '../../../common/enums/static-content.enum';

export class UpdateStaticContentDto {
  contentType?: StaticContentType;
  content?: string;
  updatedBy!: string;
  status?: StaticContentStatus;
}
