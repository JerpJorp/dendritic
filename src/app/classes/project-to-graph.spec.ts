import { Project } from './project';
import { ProjectToGraphDeprecated } from './project-to-graph';

describe('ProjectToGraph', () => {
  it('should create an instance', () => {

    const p: Project = new Project({name: 'test'});

    expect(new ProjectToGraphDeprecated(p)).toBeTruthy();
  });
});
