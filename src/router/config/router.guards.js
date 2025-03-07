import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import authStorage from '@/utils/auth';
import refreshTokenFun from '@/utils/refreshToken';

class RouterGuards {
  constructor(router) {
    this.router = router;
    this.whiteRouter = ['Login', 'Logout', 'SsoLogin'];
  }

  // 初始化调用全部方法
  initRouterGuards() {
    this.beforeEach();
    this.onError();
    this.afterEach();
  }

  beforeEach() {
    return this.router.beforeEach(async (to, from, next) => {
      const loginFun = () => {
        setTimeout(() => {
          this.router.push({
            name: 'SsoLogin',
          });
        }, 600);
      };
      NProgress.start();
      // 判断是否是白名单，白名单不需要进行登录验证
      if (this.whiteRouter.includes(to.name)) {
        next();
      } else {
        // 判断是否登录，如果没登录，需要先跳转到登录
        if (!authStorage.getUserInfo()) {
          const { fullPath } = to;

          JSON.parse(authStorage.getIsSsoLoginInfo()) ? next(`/sso-login?redirecturl=${fullPath}`) : next(`/login?redirecturl=${fullPath}`);
          return;
        }
        // 判断是否需要刷新
        if (JSON.parse(authStorage.getIsSsoLoginInfo())) {
          (await refreshTokenFun()) ? next() : loginFun();
          return;
        }
        next();
      }
    });
  }

  onError() {
    return this.router.onError((e) => {
      console.error(e);
      NProgress.done();
    });
  }

  afterEach() {
    return this.router.afterEach((to) => {
      document.title = to.meta?.title ? to.meta.title : 'vue2-template-portal';
      NProgress.done();
    });
  }
}

export default RouterGuards;
