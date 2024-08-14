import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types, Model, ObjectId } from 'mongoose';
import { Poll, Event } from '../common/schema/event.schema';
import { VoteDto } from './dto/vote.dto';
import { User } from '../common/schema/user.schema';
import { Auth } from '../common/schema/auth.schema';
import { compareDates, formatDate } from 'src/common/util/dateUtil';

async function validateData(
  eventModel: Model<Event>,
  userModel: Model<User>,
  id: string,
  vote: VoteDto,
): Promise<void> {
  const event = await eventModel.findById(id as unknown as Types.ObjectId);

  if (!event) {
    throw new NotFoundException(`Event with id ${id} not found`);
  }
  if (compareDates(formatDate(new Date()), formatDate(event.startDate)) >= 1) {
    throw new BadRequestException('Event date has passed');
  }

  const user = await userModel.findById(vote.userId);
  if (!user) {
    throw new NotFoundException(`User with id ${vote.userId} not found`);
  }

  if (!event.poll || !event.poll.options) {
    throw new BadRequestException('This event does not have a poll');
  }
}

function validatePollData(poll: Poll) {
  if (poll.isMultipleVote === undefined) {
    poll.isMultipleVote = false;
  }
  if (poll.question.length === 0) {
    throw new BadRequestException('Poll question cannot be empty');
  }
  if (poll.options.length <= 1) {
    throw new BadRequestException('Poll options must be more than one');
  }
  if (poll.options.length > 3) {
    throw new BadRequestException('Poll options must be 3 or 2');
  }
  if (poll.options.some((opt) => opt.option.length <= 1)) {
    throw new BadRequestException(
      'Poll option cannot be less than 1 character',
    );
  }
  for (let i = 0; i < poll.options.length; i++) {
    for (let j = i + 1; j < poll.options.length; j++) {
      if (poll.options[i].option === poll.options[j].option) {
        throw new BadRequestException('Poll options must be unique');
      }
    }
  }
}

async function getAllParticipants(
  userModel: Model<User>,
  authModel: Model<Auth>,
) {
  let emails: string[] = [];
  let users = await userModel.find();
  let userIds = users.map((user) => user._id);
  for (const userId of userIds) {
    const user = await userModel
      .findById(userId)
      .populate('auth', 'email')
      .select('auth');
    const auth = await authModel.findById(user.auth);
    emails.push(auth.email);
  }
  return emails;
}

function validateDate(startDate: Date, endDate?: Date): void {
  if (compareDates(formatDate(startDate), formatDate(endDate)) >= 1) {
    throw new BadRequestException('End date must be after or same start date');
  }
  if (compareDates(formatDate(new Date()), formatDate(startDate)) >= 1) {
    throw new BadRequestException('Event date has passed');
  }
}

async function getParticipantsByUserId(
  userModel: Model<User>,
  authModel: Model<Auth>,
  participants: string[],
): Promise<Types.ObjectId[]> {
  let userIds: Types.ObjectId[] = [];
  for (let i = 0; i < participants.length; i++) {
    const auth = await authModel.findOne({ email: participants[i] });
    const user = await userModel.findOne({ auth: auth._id });
    if (!user) {
      throw new NotFoundException(
        `User with email ${participants[i]} not found`,
      );
    }
    userIds.push(user._id);
  }
  return userIds;
}

export {
  validateData,
  validatePollData,
  getAllParticipants,
  validateDate,
  getParticipantsByUserId,
};
