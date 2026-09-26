create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Vision One user'),
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id, currency_code)
  select new.id, code from public.currencies where active
  on conflict (user_id, currency_code) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
