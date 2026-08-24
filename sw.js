const CACHE_NAME = "taxi-calculadora-v2";


const FILES_TO_CACHE = [

  "./",

  "./index.html",

  "./manifest.json",

  "./sw.js"

];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(cache => {

          return cache.addAll(
            FILES_TO_CACHE
          );

        })

    );

    self.skipWaiting();

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()

        .then(cacheNames => {

          return Promise.all(

            cacheNames

              .filter(
                name =>
                  name !== CACHE_NAME
              )

              .map(
                name =>
                  caches.delete(name)
              )

          );

        })

    );

    self.clients.claim();

  }
);


self.addEventListener(
  "fetch",
  event => {

    /*
      Solo manejamos solicitudes GET.
    */

    if (event.request.method !== "GET") {

      return;

    }


    event.respondWith(

      caches
        .match(event.request)

        .then(cachedResponse => {


          /*
            Si ya tenemos el archivo
            guardado, lo usamos.
          */

          if (cachedResponse) {

            return cachedResponse;

          }


          /*
            Si no está en caché,
            intentamos descargarlo.
          */

          return fetch(event.request)

            .then(response => {


              /*
                Guardamos recursos válidos
                para poder utilizarlos offline.
              */

              if (
                response &&
                response.status === 200 &&
                response.type === "basic"
              ) {


                const responseClone =
                  response.clone();


                caches
                  .open(CACHE_NAME)

                  .then(cache => {

                    cache.put(
                      event.request,
                      responseClone
                    );

                  });

              }


              return response;

            })


            .catch(() => {


              /*
                Si no hay Internet y no
                encontramos el recurso,
                mostramos la aplicación.
              */

              return caches.match(
                "./index.html"
              );

            });

        })

    );

  }
);
