import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seeds');

async function runSeeds(): Promise<void> {
  logger.log('Inicializando DataSource para seeds...');
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    logger.log('Seeds ejecutados correctamente.');
    // Los seeds individuales se importarán aquí en pasos posteriores:
    // await runPermissionsSeed(dataSource);
    // await runRolesSeed(dataSource);
    // await runSuperAdminSeed(dataSource);
  } catch (error) {
    logger.error('Error ejecutando seeds:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    logger.log('DataSource cerrado.');
  }
}

runSeeds().catch((err) => {
  console.error(err);
  process.exit(1);
});