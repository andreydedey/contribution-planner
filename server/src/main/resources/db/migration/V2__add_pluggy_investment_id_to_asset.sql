-- Filled when the asset comes from Pluggy; assets typed by hand keep it null.
alter table asset add column pluggy_investment_id varchar(64) unique;
