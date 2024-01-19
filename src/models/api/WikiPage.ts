export interface WikiPage {
  id: number
  title: string
  parent?: {
    title: string
  }
  text: string
  version: number
  author: {
    id: number
    name: string
  }
  comments: string
  created_on: string
  updated_on: string
}

export interface WikiPageResponse {
  wiki_page: WikiPage
}
