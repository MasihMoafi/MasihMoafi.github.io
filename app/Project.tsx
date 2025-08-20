// components/Projects.js
import Image from 'next/image';

const Projects = () => {
  const projects = [
    { id: 1, title: 'Project 1', image: '/project1.jpg' },
    { id: 2, title: 'Project 2', image: '/project2.jpg' },
    { id: 3, title: 'Project 3', image: '/project3.jpg' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-12 text-center">My Projects</h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            >
              <Image
                src={project.image}
                alt={project.title}
                width={300}
                height={200}
                className="w-full h-auto rounded-t-lg"
              />
              <h3 className="text-xl font-bold mt-4">{project.title}</h3>
              {/* Add project description here */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;