import { StaticContentStatus, StaticContentType } from '../../../common/enums/static-content.enum';

export class CreateStaticContentDto {
  contentType!: StaticContentType;
  content!: string;
  addedBy!: string;
  status?: StaticContentStatus;
}
