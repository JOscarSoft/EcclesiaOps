import { Injectable, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Member } from '../members/schemas/member.schema';
import { Finance } from '../finance/schemas/finance.schema';

@Injectable()
export class StatsService {
  constructor(
    @Inject(`${Member.name}Model`) private memberModel: Model<Member>,
    @Inject(`${Finance.name}Model`) private financeModel: Model<Finance>,
    @Inject('ChurchModel') private churchModel: Model<any>, // Force registration
  ) {}

  private getLastYearDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }

  private getMemberMatch(churchId?: string) {
    const match: any = { 
      isActive: true,
      createdAt: { $gte: this.getLastYearDate() }
    };
    if (churchId && churchId !== 'undefined') {
      if (Types.ObjectId.isValid(churchId)) {
        match.church = { $in: [churchId, new Types.ObjectId(churchId)] };
      } else {
        match.church = churchId;
      }
    }
    return match;
  }

  private getFinanceMatch(churchId?: string) {
    const match: any = { 
      isDeleted: false,
      date: { $gte: this.getLastYearDate() }
    };
    if (churchId && churchId !== 'undefined') {
      if (Types.ObjectId.isValid(churchId)) {
        match.church = { $in: [churchId, new Types.ObjectId(churchId)] };
      } else {
        match.church = churchId;
      }
    }
    return match;
  }

  async getExecutiveSummary(churchId?: string) {
    const memberMatch = this.getMemberMatch(churchId);
    const financeMatch = this.getFinanceMatch(churchId);

    // 1. Members count
    const totalMembers = await this.memberModel.countDocuments(memberMatch);
    
    // 2. Finance Summary (Aggregated)
    const financeStats = await this.financeModel.aggregate([
      { $match: financeMatch },
      {
        $group: {
          _id: '$kind',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const statsMap = financeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, { Tithe: 0, Offering: 0, Expense: 0 });

    // 3. Churches count (This is global, usually doesn't filter by date unless we want new churches)
    const totalChurches = await this.churchModel.countDocuments({ isActive: true });

    return {
      members: {
        total: totalMembers,
      },
      finance: {
        income: statsMap.Tithe + statsMap.Offering,
        expenses: statsMap.Expense,
        balance: (statsMap.Tithe + statsMap.Offering) - statsMap.Expense
      },
      churches: {
        total: totalChurches
      }
    };
  }

  async getFinanceTrends(churchId?: string) {
    const match = this.getFinanceMatch(churchId);
    // Overwrite date for 12 months instead of default 6 if needed, but last year is 12 months.
    // The default getFinanceMatch already filters last 12 months.

    return this.financeModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            kind: '$kind'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: { month: '$_id.month', year: '$_id.year' },
          income: {
            $sum: {
              $cond: [{ $in: ['$_id.kind', ['Tithe', 'Offering']] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.kind', 'Expense'] }, '$total', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  async getMemberDemographics(churchId?: string) {
    const match = this.getMemberMatch(churchId);

    return this.memberModel.aggregate([
      { $match: match },
      {
        $facet: {
          byGender: [
            { $group: { _id: '$gender', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          growth: [
             {
               $group: {
                 _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                 count: { $sum: 1 }
               }
             },
             { $sort: { '_id.year': 1, '_id.month': 1 } }
          ]
        }
      }
    ]);
  }

  async getFinanceByCategories(churchId?: string) {
    const match = this.getFinanceMatch(churchId);
    return this.financeModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'financecategories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          total: { $sum: '$amount' },
          type: { $first: '$kind' }
        }
      },
      { $sort: { total: -1 } }
    ]);
  }

  async getFinanceByChurch() {
    const match = this.getFinanceMatch();
    return this.financeModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'churches',
          localField: 'church',
          foreignField: '_id',
          as: 'churchInfo'
        }
      },
      { $unwind: { path: '$churchInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { 
            churchName: { $ifNull: ['$churchInfo.name', 'Nivel Conciliar'] },
            kind: '$kind'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.churchName',
          income: {
            $sum: {
              $cond: [{ $in: ['$_id.kind', ['Tithe', 'Offering']] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.kind', 'Expense'] }, '$total', 0]
            }
          }
        }
      },
      { $sort: { income: -1 } }
    ]);
  }
}
