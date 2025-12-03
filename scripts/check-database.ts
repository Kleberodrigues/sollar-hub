import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco de dados...\n');

  // Listar todas as tabelas
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error('❌ Erro ao buscar tabelas:', error);
    return;
  }

  console.log('📋 Tabelas encontradas:\n');
  tables?.forEach((table, index) => {
    console.log(`${index + 1}. ${table.table_name}`);
  });

  console.log('\n📊 Total de tabelas:', tables?.length || 0);

  // Para cada tabela, buscar as colunas
  console.log('\n📝 Estrutura detalhada:\n');

  for (const table of tables || []) {
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', table.table_name)
      .order('ordinal_position');

    console.log(`\n--- ${table.table_name} ---`);
    columns?.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
  }
}

checkDatabase();
