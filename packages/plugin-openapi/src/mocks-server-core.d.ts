declare module "@mocks-server/core" {
  import type { NestedCollections, Item } from "@mocks-server/nested-collections";
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
    silly(message: string): void
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

  interface Collection {
    id: string,
    from: string,
    routes: string[],
  }

  interface OptionProperties {
    description: string,
    name: string,
    type: string,
    default?: unknown,
    nullable?: boolean,
  }

  interface ConfigOption {
    value: unknown
  }

  interface Config {
    addNamespace(name: string): Config
    addOptions(options: OptionProperties[]): ConfigOption[]
  }

  type Routes = Route[]
  type Collections = Collection[]

  interface MockLoaders {
    loadRoutes(routes: Routes): void,
    loadCollections(collections: Collections): void
  }

  interface Mock {
    createLoaders(): MockLoaders
  }

  class Alerts extends NestedCollections {
    // @ts-expect-error Nested collections must be extended in core
    set(id: string, value: string, error: Error): Item
  }

  interface Core {
    logger: Logger
    alerts: Alerts
    files: Files
    mock: Mock,
    config: Config,
  }
}
