# Commenting System

The commenting system uses a tree-based structure to store comments. Rather than using parent_ids as a reference, we utilize array types
from PostGres to store the id references for child comments. While this can make it semi expensive to query parents, it is much less expensive
for query child comments.

Example of how this table looks

```sql
-- The comment tree:
--          [1]
--         /    \
--       [2]    [4]
--      /   \      \
--    [3]   [7]    [6]
--   /
-- [5]

-- This is an improved version of the classic adjacency list in SQL used to model
-- trees. By replacing the parent_id with an array of ancestors, one can query
-- all nested child elements without the need for recursive queries. This makes it
-- more efficient. This works for any database that supports array-like data
-- types (Postgres supports arrays natively, while MySQL and Sqlite3 support JSON
-- arrays)

-- This method is referred to as the 'Path Enumeration' in
-- https://stackoverflow.com/a/192462. The stackoverflow answer espouses something
-- called a 'Closure Table', but Path Enumeration is much simpler to use.  It is
-- also mentioned in
-- https://www.sqlteam.com/articles/more-trees-hierarchies-in-sql as a better
-- alternative to Joe Celko's 'Nested Set' model.
```

```sql
CREATE TABLE comments (
    id INT UNIQUE,
    childCommentIds  INT[]
);
INSERT INTO comments
    (id, childCommentIds)
VALUES
    (1, NULL),
    (2, '{1}'),
    (4, '{1}'),
    (3, '{1, 2}'),
    (7, '{1, 2}'),
    (6, '{1, 4}'),
    (5, '{1, 2, 3}');
-- Postgres: Get all childCommentIds of comment 3, ordered by depth
SELECT
  childCommentIds
FROM
    comments
WHERE
    id = 3
;
-- Postgres: Get all descendants of comment 1, ordered by depth
SELECT
    id,
    array_length(childCommentIds) AS depth
FROM
    comments
WHERE
    1 = ANY(childCommentIds)
ORDER BY
    depth
;
-- Postgres: Get all siblings of comment 3
SELECT
    id
FROM
    comments
WHERE
    childCommentIds = (SELECT c2.childCommentIds FROM comments AS c2 WHERE c2.id = 3)
    AND id <> 3
;
-- Postgres: Add comment 8 under comment 7
INSERT INTO comments
    (id, childCommentIds)
    SELECT
        8,
        array_append(childCommentIds, id)
    FROM
        comments
    WHERE
        id = 7
;
-- Postgres: Delete comment 2 and all its child comments
DELETE FROM
    comments
WHERE
    id = 2
    OR 2 = ANY(childCommentIds)
;
```
