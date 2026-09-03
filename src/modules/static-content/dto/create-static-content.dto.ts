import { StaticContentStatus, StaticContentType } from '../../../common/enums/static-content.enum';

export class CreateStaticContentDto {
  contentType!: StaticContentType;
  content!: string;
  status?: StaticContentStatus;
}
