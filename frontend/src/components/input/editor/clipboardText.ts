import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain-text version of a copied slice. ProseMirror's default serializer joins the
// text of every block without any structure, which drops the markers of lists. This
// keeps "- " / "1. " markers so the copied text still reads as the list it was.

const LIST_NAMES = new Set(['bulletList', 'orderedList', 'taskList'])

function listItemText(item: ProseMirrorNode, marker: string): string {
	const inner = blocksText(item.content.content, '\n')
	const continuation = ' '.repeat(marker.length)

	return inner
		.split('\n')
		.map((line, index) => (index === 0 ? marker + line : continuation + line))
		.join('\n')
}

function listText(list: ProseMirrorNode): string {
	const ordered = list.type.name === 'orderedList'
	const start = ordered ? Number(list.attrs.start ?? 1) : 1

	return list.content.content
		.map((item, index) => listItemText(item, ordered ? `${start + index}. ` : '- '))
		.join('\n')
}

function nodeText(node: ProseMirrorNode): string {
	if (LIST_NAMES.has(node.type.name)) {
		return listText(node)
	}

	if (node.isTextblock) {
		return node.textContent
	}

	return blocksText(node.content.content, '\n\n')
}

function blocksText(nodes: readonly ProseMirrorNode[], separator: string): string {
	return nodes.map(nodeText).join(separator)
}

export function sliceToPlainText(slice: Slice): string {
	return blocksText(slice.content.content, '\n\n')
}
