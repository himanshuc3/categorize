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
			extensions: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv']
		},
		{
			name: 'documents',
			extensions: [
				'zip',
				'doc',
				'docx',
				'ppt',
				'xls',
				'html',
				'txt',
				'pdf'
			]
		},
		{
			name: 'executables',
			extensions: [
				'exe',
				'msi',
				'dmg',
				'pkg',
				'deb',
				'rpm',
				'app',
				'appx',
				'appxbundle',
				'appxupload'
			]
		},
		{
			name: 'images',
			extensions: [
				'jpg',
				'jpeg',
				'png',
				'svg',
				'gif',
				'ico',
				'webp',
				'heic',
				'heif'
			]
		}
	],
	prefix: 'categorize',
	extra: {
		name: 'miscellaneous'
	}
};
