import { Poll } from '../../poll.events/interfaces/poll.interface';

export interface Event {
  title: string;
  description: string;
  date: Date;
  poll?: Poll;
}
