const nconf = require("nconf");

const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - SQL');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(nconf.get('database:database_name'), nconf.get('database:username'), nconf.get('database:password'), {
    host: nconf.get('database:host'),
    dialect:  nconf.get('database:dialect'),
    'define': {
      'underscored': true,
      'charset':'utf8mb4'
    },
    logging: msg => log.trace(msg)  
  });

sequelize.authenticate().then(() => {
    log.info('Connexion a la base réussi ! ');
    
    }).catch(err => {
    log.error('Erreur lors de la connexion à la base de donnée !');
    log.error(err);
  });

    const modelDefiners = [
      require('./models/song.model')
    ];
    
    for (const modelDefiner of modelDefiners) {
      modelDefiner(sequelize);
    }

sequelize.sync().then(() => {
      log.info('Synchronisation de la base réussi !');
      
      }).catch(err => {
      log.error('Erreur lors de la synchronisation de la base de donnée !');
      log.error(err);
    });
  
module.exports = sequelize;

