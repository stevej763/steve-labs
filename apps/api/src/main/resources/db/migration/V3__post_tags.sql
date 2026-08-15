CREATE TABLE tags (
    slug VARCHAR(80) PRIMARY KEY
);

CREATE TABLE post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_slug VARCHAR(80) NOT NULL REFERENCES tags(slug),
    PRIMARY KEY (post_id, tag_slug)
);

CREATE INDEX post_tags_tag_slug_idx ON post_tags (tag_slug);