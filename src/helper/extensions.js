// TODO: Create a json file instead
// ROllup build error blocking, therefore
// had to go with js for now.
export default {
	default: [
		{
			name: 'audio',
			extensions: ['mp3', 'wav', 'aac', 'wma']
		},
		{
			name: 'video',
			extensions: ['mp4']
		},
		{
			name: 'documents',
			extensions: ['zip', 'doc', 'docx', 'ppt', 'xls', 'html']
		},
		{
			name: 'images',
			extensions: ['jpg', 'jpeg', 'png', 'svg']
		}
	],
	prefix: 'categorize',
	extra: {
		name: 'miscellaneous'
	}
};
