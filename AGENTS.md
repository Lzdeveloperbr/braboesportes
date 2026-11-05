<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Multi-tenant: every club-owned table has `club_id` (default `current_club_id()`) plus a RESTRICTIVE `club_isolation` RLS policy using `is_club_member(club_id)`; new club tables must follow the same pattern so club data never leaks across clubs.
