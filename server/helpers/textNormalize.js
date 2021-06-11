const replaceSpecialChars = (str) => {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.replace(/([^\w]+|\s+)/g, '_') // Substitui espaço e outros caracteres por underline
		.replace(/\-\-+/g, '_')	// Substitui multiplos hífens por um único underline
		.replace(/(^-+|-+$)/, '').toLowerCase(); // Remove hífens extras do final ou do inicio da string
};

export default replaceSpecialChars;