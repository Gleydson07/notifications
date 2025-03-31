/**
 * Lista de possíveis erros do MongoDB com códigos e mensagens de tratamento,
 * incluindo o status HTTP adequado para cada erro.
 */

import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';

const MongoMappedErrors: Record<number, { message: string; httpStatus: HttpStatus }> = {
  /**
   * Código: 11000
   * Descrição: Ocorre quando há uma violação de índice único (chave duplicada).
   */
  11000: {
    message: 'Duplicate key error: A record with this value already exists.',
    httpStatus: HttpStatus.CONFLICT, // 409
  },

  /**
   * Código: 50
   * Descrição: Ocorre quando a operação no MongoDB excede o tempo limite configurado.
   */
  50: {
    message: 'Operation exceeded time limit.',
    httpStatus: HttpStatus.REQUEST_TIMEOUT, // 408
  },

  /**
   * Código: 13
   * Descrição: Ocorre quando o usuário não tem permissões suficientes para executar a operação.
   */
  13: {
    message: 'Unauthorized: You do not have permission to perform this operation.',
    httpStatus: HttpStatus.FORBIDDEN, // 403
  },

  /**
   * Código: 2
   * Descrição: Ocorre quando há erros de sintaxe ou de parâmetros inválidos em uma operação.
   */
  2: {
    message: 'Bad value: There is an issue with the provided query or operation.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 26
   * Descrição: Ocorre quando o banco de dados especificado não existe.
   */
  26: {
    message: 'Namespace not found: The specified database or collection does not exist.',
    httpStatus: HttpStatus.NOT_FOUND, // 404
  },

  /**
   * Código: 73
   * Descrição: Ocorre quando uma coleção não pode ser criada porque já existe.
   */
  73: {
    message: 'Collection already exists.',
    httpStatus: HttpStatus.CONFLICT, // 409
  },

  /**
   * Código: 121
   * Descrição: Ocorre quando um documento não atende aos requisitos definidos por um validator.
   */
  121: {
    message: 'Document validation failed.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 16755
   * Descrição: Ocorre quando o agrupamento (aggregation) contém uma referência inválida ou incorreta.
   */
  16755: {
    message: 'Aggregation error: Invalid reference or stage in the pipeline.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 10334
   * Descrição: Ocorre quando o documento excede o limite de tamanho permitido pelo MongoDB.
   */
  10334: {
    message: 'Document too large: Exceeds the 16MB size limit.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 8000
   * Descrição: Ocorre quando a transação falha devido a bloqueios ou conflitos.
   */
  8000: {
    message: 'Transaction error: Conflicts detected during the operation.',
    httpStatus: HttpStatus.CONFLICT, // 409
  },

  /**
   * Código: 112
   * Descrição: Ocorre quando um campo com um tipo de dado inválido é usado em uma operação.
   */
  112: {
    message: 'Type mismatch: Invalid type for the specified operation.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 31
   * Descrição: Ocorre quando há uma violação de esquema ao inserir ou atualizar um documento.
   */
  31: {
    message: 'Schema validation error: The document does not conform to the schema.',
    httpStatus: HttpStatus.BAD_REQUEST, // 400
  },

  /**
   * Código: 13435
   * Descrição: Ocorre quando o servidor MongoDB está indisponível ou há falha na replicação.
   */
  13435: {
    message: 'Replication error: Cannot connect to the primary node.',
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE, // 503
  },

  /**
   * Código: 11600
   * Descrição: Ocorre quando uma operação não pode ser concluída devido a um estado inconsistente.
   */
  11600: {
    message: 'Internal error: MongoDB encountered an unexpected state.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR, // 500
  },
};

export function toHttpError(error: { message: string, code: number, status?: number }) {
  console.error(error.message);

  if (MongoMappedErrors[error?.code]) {
    throw new HttpException(
      MongoMappedErrors[error?.code].message,
      MongoMappedErrors[error?.code].httpStatus
    );
  }

  throw new HttpException(
    error?.message || 'An unexpected error occurred',
    error?.status || HttpStatus.INTERNAL_SERVER_ERROR
  );
}
