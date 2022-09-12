export abstract class QueryService {
  generatePrismaWhereQuery(query: object): object {
    // Take all the keys in the object, and generate a where clause with AND for each key
    // e.g. { id: { equals: 1 } } => { where: { id: { equals: 1 } } }
    const where = { AND: [] };
    Object.keys(query).forEach((key) => {
      where.AND.push({ [key]: query[key] });
    });
    return { where };
  }
}
