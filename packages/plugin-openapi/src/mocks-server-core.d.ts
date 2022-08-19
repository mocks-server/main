declare module "@mocks-server/core" {
  import type Collection from "@mocks-server/nested-collections";
  import type { OpenAPIV3 } from "openapi-types";

  enum VariantTypes {
    JSON = "json",
    TEXT = "text",
    STATUS = "status"
  }

  type RouteVariantTypes = VariantTypes

  interface Logger {
    verbose(message: string): void
    debug(message: string): void
  }

  interface FileContents {
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any,
  }

  interface FileErrors {
    path: string,
    error: Error,
  }

  type FilesContents = FileContents[]
  type FilesErrors = FileErrors[]

  type FilesLoaderOnLoad = (filesContents: FilesContents, filesErrors: FilesErrors) => void

  interface FilesLoaderOptions {
    id: string,
    src: string,
    onLoad: FilesLoaderOnLoad,
  }

  interface Files {
    createLoader(options: FilesLoaderOptions): void
    path: string
  }

  interface HTTPHeaders {
    [header: string]: string;
  }

  interface JsonVariantOptions {
    status: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: object | [],
    headers?: HTTPHeaders,
  }

  interface TextVariantOptions {
    status: number,
    body: string,
    headers?: HTTPHeaders,
  }

  interface StatusVariantOptions {
    status: number,
  }

  interface RouteVariant {
    id: string,
    type: RouteVariantTypes
    options: JsonVariantOptions | TextVariantOptions | StatusVariantOptions,
  }

  type RouteVariants = RouteVariant[] | null

  interface Route {
    id: string,
    url: string,
    method: OpenAPIV3.HttpMethods,
    variants: RouteVariants,
  }

  type Routes = Route[]

  interface MockLoaders {
    loadRoutes(routes: Routes): void
  }

  interface Mock {
    createLoaders(): MockLoaders
  }

  interface Core {
    logger: Logger
    alerts: typeof Collection,
    files: Files
    mock: Mock
  }
}
