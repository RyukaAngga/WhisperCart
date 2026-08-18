create table products (
  id bigint generated always as identity primary key,
  external_id text unique,
  title text not null,
  description text,
  price numeric not null default 0,
  category text,
  image text,
  stock integer default 0,
  created_at timestamptz default now()
);

create table orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id),
  email text,
  items jsonb not null,
  total numeric not null default 0,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table orders enable row level security;

create policy "semua orang boleh melihat produk"
on products for select
using (true);

create policy "pengguna hanya melihat pesanan miliknya"
on orders for select
using (auth.uid() = user_id);

create policy "pengguna hanya membuat pesanan miliknya"
on orders for insert
with check (auth.uid() = user_id);
