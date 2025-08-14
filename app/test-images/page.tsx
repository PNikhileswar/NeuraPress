import Image from 'next/image';
export default function ImageTestPage() {
  const testImages = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center',
  ];
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold">Using Next.js Image Component</h2>
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Image {index + 1}</h3>
            <p className="text-sm text-gray-600 mb-2">URL: {src}</p>
            <div className="aspect-video relative w-full max-w-md">
              <Image
                src={src}
                alt={`Test image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                unoptimized // Disable Next.js optimization to test raw Unsplash URLs
              />
            </div>
          </div>
        ))}
        <h2 className="text-2xl font-semibold">Using Regular img Tag</h2>
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Image {index + 1} (regular img)</h3>
            <p className="text-sm text-gray-600 mb-2">URL: {src}</p>
            <img
              src={src}
              alt={`Test image ${index + 1}`}
              className="w-full max-w-md h-64 object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}