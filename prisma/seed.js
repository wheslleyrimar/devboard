import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  {
    name: 'Finance Tracker',
    desc: 'App de controle financeiro pessoal com dashboards, categorização automática de gastos e metas mensais.',
    stack: ['React', 'TypeScript', 'Supabase'],
    status: 'active',
  },
  {
    name: 'DevBoard',
    desc: 'Este dashboard — painel para desenvolvedores organizarem projetos pessoais e freelas em um só lugar.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    status: 'active',
  },
  {
    name: 'API Gateway CLI',
    desc: 'Ferramenta de linha de comando para testar e monitorar endpoints de APIs REST em múltiplos ambientes.',
    stack: ['Go', 'Cobra'],
    status: 'paused',
  },
  {
    name: 'Portfolio v3',
    desc: 'Terceira versão do site pessoal, com blog integrado via MDX e otimizações de performance.',
    stack: ['Next.js', 'Tailwind', 'Vercel'],
    status: 'completed',
  },
  {
    name: 'Recipe Sharing App',
    desc: 'Plataforma social para compartilhamento de receitas com sistema de avaliações e listas de compras.',
    stack: ['Vue', 'Express', 'MongoDB'],
    status: 'paused',
  },
  {
    name: 'Task Sync',
    desc: 'Sincronizador de tarefas entre Notion, Todoist e Google Calendar via webhooks.',
    stack: ['Python', 'FastAPI', 'Redis'],
    status: 'active',
  },
  {
    name: 'Chat Widget SDK',
    desc: 'SDK embutível de chat em tempo real para sites de terceiros, com temas customizáveis.',
    stack: ['TypeScript', 'WebSocket', 'Rollup'],
    status: 'completed',
  },
  {
    name: 'Habit Tracker Mobile',
    desc: 'App mobile para acompanhamento de hábitos diários com notificações e streaks.',
    stack: ['React Native', 'Firebase'],
    status: 'active',
  },
];

async function main() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log('Seed ignorado: já existem projetos no banco.');
    return;
  }
  await prisma.project.createMany({ data: projects });
  console.log(`Seed concluído: ${projects.length} projetos criados.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
