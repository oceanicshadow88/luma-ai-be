import { DEFAULT_MEMBERSHIP_STATUS, MembershipStatusType, ROLE, RoleType } from '@src/config';
import MembershipModel, { Membership } from '@src/models/membership';
import mongoose from 'mongoose';

export default class MembershipBuilder {
  private readonly membership: Partial<Membership>;

  constructor() {
    this.membership = {
      company: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      role: ROLE.ADMIN,
      status: DEFAULT_MEMBERSHIP_STATUS,
    };
  }

  withCompany(companyId: string | mongoose.Types.ObjectId): this {
    this.membership.company = new mongoose.Types.ObjectId(companyId);
    return this;
  }

  withUser(userId: string | mongoose.Types.ObjectId): this {
    this.membership.user = new mongoose.Types.ObjectId(userId);
    return this;
  }

  withRole(role: RoleType): this {
    this.membership.role = role;
    return this;
  }

  withStatus(status: MembershipStatusType): this {
    this.membership.status = status;
    return this;
  }

  build(): Membership {
    return new MembershipModel(this.membership) as Membership;
  }

  async save(): Promise<Membership> {
    return await this.build().save();
  }
}
