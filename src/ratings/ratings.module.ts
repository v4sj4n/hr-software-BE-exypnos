// project.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from 'src/common/schema/project.schema';
import { ProjectService } from './project.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])],
  providers: [ProjectService],
  exports: [ProjectService], // Make sure the service is exported if it's used elsewhere
})
export class ProjectModule {}
