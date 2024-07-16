export interface Poll {
    question: string;
    options: PollOption[];
  }
  
  export interface PollOption {
    option: string;
    votes: number;
  }
  