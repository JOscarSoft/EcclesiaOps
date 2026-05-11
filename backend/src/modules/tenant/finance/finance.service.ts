import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Finance, FinanceCategory } from './schemas/finance.schema';

@Injectable()
export class FinanceService {
  constructor(
    @Inject('FINANCE_MODEL') private financeModel: Model<Finance>,
    @Inject('FINANCE_CATEGORY_MODEL') private categoryModel: Model<FinanceCategory>,
    @Inject('MEMBER_MODEL') private memberModel: Model<any>,
    @Inject('CHURCH_MODEL') private churchModel: Model<any>, // Force registration
  ) { }

  // --- CATEGORIES ---
  async findAllCategories(type?: string) {
    const query: any = { isDeleted: false };
    if (type) query.type = type;
    return this.categoryModel.find(query).exec();
  }

  async createCategory(data: any) {
    return this.categoryModel.create(data);
  }

  // --- TRANSACTIONS ---
  async findAllTransactions(churchId?: string, filters: { from?: string, to?: string, church?: string, category?: string, kind?: string } = {}) {
    const query: any = { isDeleted: false };

    if (filters.church === '__null__') {
      query.church = null;
    } else if (filters.church) {
      query.church = filters.church;
    } else if (churchId) {
      query.church = churchId;
    }

    if (filters.from || filters.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }

    if (filters.category) query.category = filters.category;
    if (filters.kind) query.kind = filters.kind;

    return this.financeModel.find(query)
      .populate('category')
      .populate('church', 'name')
      .populate('member', 'firstName lastName')
      .sort({ date: -1 })
      .exec();
  }

  async createTransaction(data: any) {
    return this.financeModel.create(data);
  }

  async removeTransaction(id: string) {
    const transaction = await this.financeModel.findById(id);
    if (!transaction) throw new NotFoundException('Transacción no encontrada');
    transaction.isDeleted = true;
    return transaction.save();
  }

  async getBalance(month: any, year: any, churchId?: string) {
    const m = Number(month);
    const y = Number(year);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const query: any = {
      isDeleted: false,
      date: { $gte: startDate, $lte: endDate }
    };
    if (churchId) query.church = churchId;

    const transactions = await this.financeModel.find(query).exec();

    const income = transactions.filter(t => t.kind === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions.filter(t => t.kind === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      expenses,
      totalIncome: income,
      netBalance: income - expenses
    };
  }

  async getMemberContributions(memberId: string) {
    const transactions = await this.financeModel.find({
      member: new Types.ObjectId(memberId),
      isDeleted: false,
      kind: 'Income'
    })
      .populate('category', 'name type')
      .sort({ date: -1 })
      .exec();

    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      transactions,
      total,
    };
  }
}
