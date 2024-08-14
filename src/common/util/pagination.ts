import { FilterQuery, Model } from 'mongoose';

export async function paginate(
  page: number,
  limit: number,
  model: Model<any>,
  filter: FilterQuery<any>,
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      page = page ? page : 1;
      limit = limit ? limit : 5;
      const count = await model.find(filter).countDocuments();
      const totalPages = Math.floor((count - 1) / limit) + 1;
      const data = await model
        .find(filter)
        .limit(limit)
        .skip((page - 1) * limit);
      resolve({ data, totalPages, all: count });
      return { data, totalPages: totalPages, all: count };
    } catch (error) {
      reject('Failed to paginate');
    }
  });
}
