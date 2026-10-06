-- Seed categories for V1
insert into categories (name, slug) values
  ('Electrician', 'electrician'),
  ('Plumber', 'plumber'),
  ('Welder', 'welder'),
  ('Carpenter', 'carpenter'),
  ('Mechanic', 'mechanic'),
  ('Cleaner', 'cleaner'),
  ('AC Technician', 'ac-technician'),
  ('Generator Technician', 'generator-technician'),
  ('Phone Repair', 'phone-repair'),
  ('Photographer', 'photographer'),
  ('Videographer', 'videographer'),
  ('Barber', 'barber'),
  ('Hair Stylist', 'hair-stylist'),
  ('Tailor', 'tailor'),
  ('Painter', 'painter'),
  ('Makeup Artist', 'makeup-artist'),
  ('Computer Repair', 'computer-repair'),
  ('Car Wash', 'car-wash')
on conflict (slug) do nothing;
