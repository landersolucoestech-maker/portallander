begin;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'form-submissions',
  'form-submissions',
  false,
  26214400,
  array[
    'image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','application/pdf',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict(id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

commit;
