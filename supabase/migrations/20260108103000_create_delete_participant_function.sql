create or replace function delete_participant(p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.votes where participant_id = p_id;
  delete from public.participants where id = p_id;
end;
$$;