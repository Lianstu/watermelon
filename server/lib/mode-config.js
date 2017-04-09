/**
 * Created by lianshaoshuai on 17/3/30.
 */

var disableCUDMethods = (Model) => {
  Model.disableRemoteMethod('create', true);
  Model.disableRemoteMethod('upsertWithWhere', true);
  Model.disableRemoteMethod('replaceOrCreate', true);
  Model.disableRemoteMethod('updateAttribute', false);
  Model.disableRemoteMethod('updateAttributes', false);
  Model.disableRemoteMethod('replaceById', true);
  Model.disableRemoteMethod('upsert', true);
  Model.disableRemoteMethod('destroyById', true);
  Model.disableRemoteMethod('deleteById', true);
  Model.disableRemoteMethod('createChangeStream', true);
  Model.disableRemoteMethod('updateAll', true);
};
exports.disableCUDMethods = disableCUDMethods;

var disableCRUDMethods = (Model) => {
  disableCUDMethods(Model);
  Model.disableRemoteMethod('count', true);
  Model.disableRemoteMethod('exists', true);
  Model.disableRemoteMethod('findById', true);
  Model.disableRemoteMethod('find', true);
  Model.disableRemoteMethod('findOne', true);
};

exports.disableCRUDMethods = disableCRUDMethods;
