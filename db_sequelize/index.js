const Client = require('../struct/Client');
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - SQL');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(Client.config.database.database_name,Client.config.database.username, Client.config.database.password, {
    host: Client.config.database.host,
    dialect:Client.config.database.dialect,
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

