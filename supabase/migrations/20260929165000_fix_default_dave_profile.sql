-- Correct the legacy KNT profile value created from the account email prefix.
-- Other users remain profile-driven and are not changed.
update public.profiles
set display_name = 'Dave'
where lower(trim(display_name)) = 'dsengineeringhull';
