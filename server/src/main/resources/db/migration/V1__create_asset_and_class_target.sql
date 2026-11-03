-- Ativos da carteira e metas por classe (design.md da contribution-plan).
-- Valores em centavos inteiros; as quatro classes são fixas.

create table asset (
    id          bigint generated always as identity primary key,
    code        varchar(20) not null unique,
    asset_class varchar(20) not null
        check (asset_class in ('BR_STOCKS', 'US_STOCKS', 'FIXED_INCOME', 'BITCOIN')),
    value_cents bigint      not null
        check (value_cents between 0 and 10000000000)
);

create table class_target (
    asset_class    varchar(20) primary key
        check (asset_class in ('BR_STOCKS', 'US_STOCKS', 'FIXED_INCOME', 'BITCOIN')),
    target_percent smallint    not null
        check (target_percent between 0 and 100)
);

-- Metas iniciais (AC-056, ASM-014).
insert into class_target (asset_class, target_percent) values
    ('BR_STOCKS', 40),
    ('US_STOCKS', 30),
    ('FIXED_INCOME', 20),
    ('BITCOIN', 10);
