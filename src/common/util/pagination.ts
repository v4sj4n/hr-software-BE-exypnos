import { FilterQuery, Model, PipelineStage } from 'mongoose';

export async function paginate(
  page?: number,
  limit?: number,
  model?: Model<any>,
  filter?: FilterQuery<any>,
  aggregationPipeline?: PipelineStage[]
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      page = page ? page : 1;
      limit = limit ? limit : 5;

      let count: number;
      let data: any[];

      if (aggregationPipeline) {
        const countPipeline = [
          ...aggregationPipeline,
          { $count: 'total' }
        ];
        const countResult = await model.aggregate(countPipeline);
        count = countResult[0]?.total || 0;

        data = await model.aggregate([
          ...aggregationPipeline,
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ]);
      } else {
        count = await model.find(filter).countDocuments();
        data = await model
          .find(filter)
          .limit(limit)
          .skip((page - 1) * limit);
      }

      const totalPages = Math.ceil(count / limit);
      resolve({ data, totalPages, all: count });
    } catch (error) {
      reject('Failed to paginate');
    }
  });
}