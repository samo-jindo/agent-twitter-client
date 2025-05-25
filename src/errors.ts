export class ApiError extends Error {
  constructor(readonly response: Response, readonly data: any) {
    super(
      `Response status: ${response.status} | response: ${JSON.stringify(
        response,
      )} | data: ${JSON.stringify(data)}`,
    );
  }

  static async fromResponse(response: Response) {
    // Try our best to parse the result, but don't bother if we can't
    let data: string | object | undefined = undefined;
    try {
      if (response.headers.get('content-type')?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      try {
        data = await response.text();
      } catch { }
    }

    return new ApiError(response, data);
  }
}

interface Position {
  line: number;
  column: number;
}

interface TraceInfo {
  trace_id: string;
}

interface TwitterApiErrorExtensions {
  code?: number;
  kind?: string;
  name?: string;
  source?: string;
  tracing?: TraceInfo;
}

export interface TwitterApiErrorRaw extends TwitterApiErrorExtensions {
  message?: string;
  locations?: Position[];
  path?: string[];
  extensions?: TwitterApiErrorExtensions;
}
