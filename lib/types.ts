export type Board = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type List = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
};

export type Card = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
};
