'use strict';

module.exports = function(Review) {
  Review.beforeRemote("create",function(context,user,next) {
    context.args.data.createAt = Date.now();
    context.args.data.userId = context.req.accessToken.userId;
    next()
  })
};
