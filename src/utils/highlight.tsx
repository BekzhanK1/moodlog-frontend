import React from 'react'

/**
 * Highlights search query in text
 * @param text - The text to highlight
 * @param query - The search query (without # for tags)
 * @param isTagSearch - Whether this is a tag search
 * @returns JSX with highlighted text
 */
export function highlightText(text: string, query: string, isTagSearch: boolean = false): React.ReactNode {
  if (!query || !text) {
    return text
  }

  if (isTagSearch) {
    // For tag search, don't highlight in text
    return text
  }

  const searchQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let index = lowerText.indexOf(searchQuery, lastIndex)

  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index))
    }

    // Add highlighted match
    parts.push(
      <mark
        key={index}
        style={{
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-bg)',
          padding: '2px 4px',
          borderRadius: '3px',
          fontWeight: 500,
        }}
      >
        {text.substring(index, index + searchQuery.length)}
      </mark>
    )

    lastIndex = index + searchQuery.length
    index = lowerText.indexOf(searchQuery, lastIndex)
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}

/**
 * Checks if a tag should be highlighted
 * @param tag - The tag to check
 * @param query - The search query (with or without #)
 * @returns Whether the tag should be highlighted
 */
export function shouldHighlightTag(tag: string, query: string): boolean {
  if (!query || !tag) {
    return false
  }

  const isTagSearch = query.startsWith('#')
  if (!isTagSearch) {
    return false
  }

  const searchTag = query.substring(1).toLowerCase().trim()
  return tag.toLowerCase() === searchTag
}

