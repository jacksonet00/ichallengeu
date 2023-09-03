import { NextRouter } from 'next/router';

type Routes = {
  "/": undefined;
  "/new": undefinted;
  "/profile": undefined;
  "/join": {
    inviteId: string;
  };
  "/leaderboard": {
    challengeId: string;
  };
  "/login": QueryParams;
  "/signup/username": QueryParams;
  "/signup/profile-photo": QueryParams;
};
export type Route = keyof Routes;

export type QueryParams = {
  next?: Route;
  inviteId?: string;
  challengeId?: string;
};

export function getParams(router: NextRouter): QueryParams {
  let params: QueryParams = {};

  if (router.query.next) {
    params.next = decodeURIComponent(router.query.next as string) as Route;
  }

  if (router.query.inviteId) {
    params.inviteId = router.query.inviteId as string;
  }

  if (router.query.challengeId) {
    params.challengeId = router.query.challengeId as string;
  }

  return params;
}

export function push(router: NextRouter, route: Route, queryParams?: QueryParams): Promise<boolean> {
  const params = {
    ...router.query,
    ...queryParams,
  };

  if (!params.next) {
    if (route === "/join") {
      if (!params.inviteId) {
        return new Promise(() => false);
      }
      return router.push({
        pathname: route,
        query: {
          inviteId: params.inviteId,
        }
      });
    }

    if (route === "/leaderboard") {
      if (!params.challengeId) {
        return new Promise(() => false);
      }
      return router.push({
        pathname: route,
        query: {
          challengeId: params.challengeId,
        }
      });
    }

    return router.push(route);
  }

  if (params.next === "/join") {
    if (!params.inviteId) {
      return new Promise(() => false);
    }
    return router.push({
      pathname: route,
      query: {
        next: params.next,
        inviteId: params.inviteId,
      }
    });
  }

  if (params.next === "/leaderboard") {
    if (!params.challengeId) {
      return new Promise(() => false);
    }
    return router.push({
      pathname: route,
      query: {
        next: params.next,
        challengeId: params.challengeId,
      }
    });
  }

  return router.push({
    pathname: route,
    query: {
      ...params,
      next: params.next,
    }
  });
}

export function pushNext(router: NextRouter, _default?: Route): Promise<boolean> {
  const params = {
    ...router.query,
  };

  if (!params.next) {
    return router.push(_default ?? '/');
  }

  const pathname: Route = params.next as Route;
  delete params.next;

  return router.push({
    pathname,
    query: {
      ...params,
    }
  });
}