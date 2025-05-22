import { Request, Response, NextFunction } from 'express';

interface CreateCompanyInput {
  name: string;
  plan: string;
  ownerId?: string;
  settings?: {
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, plan, ownerId: ownerFromBody, settings }: CreateCompanyInput = req.body;

    // 从 JWT 中间件中获取 req.user（假设提前解析 JWT 并附加用户）
    const userFromToken = (req as any).user?._id;

    // 优先使用 token 中的 userId
    const ownerId = userFromToken || ownerFromBody;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'Owner ID is required.' });
    }

    // 创建公司数据
    const newCompany = await Company.create({
      name,
      plan,
      ownerId: new Types.ObjectId(ownerId),
      settings: {
        timezone: settings?.timezone || 'UTC',
        locale: settings?.locale || 'en',
        logoUrl: settings?.logoUrl || '',
        primaryColor: settings?.primaryColor || '#000000',
      },
    });

    return res.status(201).json({
      success: true,
      data: newCompany,
    });
  } catch (error) {
    next(error);
  }
};
