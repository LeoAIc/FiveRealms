interface EmptyScreenProps {
  imageData?: string | null; // imageData is either a string or null, and is optional
}

export function EmptyScreen({ imageData }: EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-md px-4 mb-8 mt-0">
      <div className="rounded-lg bg-background">
        
        {imageData? (
        <img src={imageData.includes("base64")?imageData:`data:image/png;base64,${imageData}`} alt="Generated Content" />
        ): <img src="./sample3.jpg"></img>}
      </div>
    </div>
  )
}
